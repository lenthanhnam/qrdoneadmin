
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import './App.css';

const App = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const ordersCollection = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(ordersCollection, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => {
        const data = doc.data();
        // Xử lý timestamp từ Firestore
        let timestamp = data.timestamp;
        console.log('Raw timestamp from Firestore:', timestamp); // Debug giá trị thô
        if (typeof timestamp === 'string') {
          // Nếu timestamp là chuỗi ISO, parse thành Date
          timestamp = new Date(timestamp);
          console.log('Parsed Date from ISO:', timestamp);
        } else if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
          // Nếu timestamp là Firestore Timestamp, chuyển về Date
          timestamp = timestamp.toDate();
          console.log('Parsed Date from Firestore Timestamp:', timestamp);
        } else {
          // Nếu timestamp không hợp lệ, đặt mặc định là null và log lỗi
          console.warn('Invalid timestamp for order ID:', doc.id, 'Value:', timestamp);
          timestamp = null;
        }
        return { id: doc.id, ...data, timestamp };
      });
      setOrders(ordersList);
      console.log('Processed orders list:', ordersList); // Debug danh sách sau khi xử lý
    }, (error) => {
      console.error('Lỗi khi lấy dữ liệu:', error.message);
      alert('Có lỗi xảy ra khi lấy danh sách đơn hàng: ' + error.message);
    });

    // Hủy subscription khi component unmount
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });
    // Không cần cập nhật state thủ công vì onSnapshot sẽ tự động cập nhật
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
    if (!confirmCancel) return;

    try {
      await updateOrderStatus(orderId, 'Đã hủy');
      alert('Hủy đơn hàng thành công!');
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      alert('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại!');
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      alert('Xóa đơn hàng thành công!');
      // Không cần cập nhật state thủ công vì onSnapshot sẽ tự động cập nhật
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error);
      alert('Có lỗi xảy ra khi xóa đơn hàng. Vui lòng thử lại!');
    }
  };

  // Nhóm các đơn hàng theo ngày
  const groupOrdersByDate = () => {
    const groupedOrders = {};
    orders.forEach(order => {
      const date = order.timestamp instanceof Date && !isNaN(order.timestamp)
        ? order.timestamp.toLocaleDateString('vi-VN')
        : 'Ngày không xác định';
      if (!groupedOrders[date]) {
        groupedOrders[date] = [];
      }
      groupedOrders[date].push(order);
    });

    // Sắp xếp các ngày theo thứ tự giảm dần
    const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
      if (a === 'Ngày không xác định') return 1;
      if (b === 'Ngày không xác định') return -1;
      return new Date(b) - new Date(a);
    });

    const sortedGroupedOrders = {};
    sortedDates.forEach(date => {
      sortedGroupedOrders[date] = groupedOrders[date];
    });

    return sortedGroupedOrders;
  };

  const groupedOrders = groupOrdersByDate();

  return (
    <div className="App">
      <h1>Quản lý đơn hàng</h1>
      {Object.keys(groupedOrders).length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        Object.keys(groupedOrders).map(date => (
          <div key={date} className="date-group">
            <h2 className="date-header">{date}</h2>
            {groupedOrders[date].map(order => (
              <div key={order.id} className="order">
                <div className="order-details">
                  <p>Người đặt: {order.userName || 'Chưa có tên'}</p>
                  <p>Đơn hàng: {order.items.map(item => item.name).join(', ')}</p>
                  <p>Tổng: {order.total.toLocaleString()}đ</p>
                  <p>Thời gian: {order.timestamp instanceof Date && !isNaN(order.timestamp) ? order.timestamp.toLocaleString('vi-VN') : 'Không xác định'}</p>
                  <p>Trạng thái: {order.status}</p>
                </div>
                <div className="order-actions">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    disabled={order.status === 'Đã hủy'}
                  >
                    <option value="Đã nhận">Đã nhận</option>
                    <option value="Đang làm">Đang làm</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                  {order.status !== 'Đã hủy' && (
                    <button
                      className="cancel-button"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Hủy món
                    </button>
                  )}
                  {order.status === 'Đã hủy' && (
                    <button
                      className="delete-button"
                      onClick={() => deleteOrder(order.id)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default App;

