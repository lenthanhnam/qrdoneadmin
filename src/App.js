
// import React, { useEffect, useState } from 'react';
// import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
// import { db } from './firebase/firebaseConfig';
// import './App.css';

// const App = () => {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     const ordersCollection = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
//     const unsubscribe = onSnapshot(ordersCollection, (snapshot) => {
//       const ordersList = snapshot.docs.map(doc => {
//         const data = doc.data();
//         // Xử lý timestamp từ Firestore
//         let timestamp = data.timestamp;
//         console.log('Raw timestamp from Firestore:', timestamp); // Debug giá trị thô
//         if (typeof timestamp === 'string') {
//           // Nếu timestamp là chuỗi ISO, parse thành Date
//           timestamp = new Date(timestamp);
//           console.log('Parsed Date from ISO:', timestamp);
//         } else if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
//           // Nếu timestamp là Firestore Timestamp, chuyển về Date
//           timestamp = timestamp.toDate();
//           console.log('Parsed Date from Firestore Timestamp:', timestamp);
//         } else {
//           // Nếu timestamp không hợp lệ, đặt mặc định là null và log lỗi
//           console.warn('Invalid timestamp for order ID:', doc.id, 'Value:', timestamp);
//           timestamp = null;
//         }
//         return { id: doc.id, ...data, timestamp };
//       });
//       setOrders(ordersList);
//       console.log('Processed orders list:', ordersList); // Debug danh sách sau khi xử lý
//     }, (error) => {
//       console.error('Lỗi khi lấy dữ liệu:', error.message);
//       alert('Có lỗi xảy ra khi lấy danh sách đơn hàng: ' + error.message);
//     });

//     // Hủy subscription khi component unmount
//     return () => unsubscribe();
//   }, []);

//   const updateOrderStatus = async (orderId, newStatus) => {
//     const orderRef = doc(db, 'orders', orderId);
//     await updateDoc(orderRef, { status: newStatus });
//     // Không cần cập nhật state thủ công vì onSnapshot sẽ tự động cập nhật
//   };

//   const cancelOrder = async (orderId) => {
//     const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
//     if (!confirmCancel) return;

//     try {
//       await updateOrderStatus(orderId, 'Đã hủy');
//       alert('Hủy đơn hàng thành công!');
//     } catch (error) {
//       console.error('Lỗi khi hủy đơn hàng:', error);
//       alert('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại!');
//     }
//   };

//   const deleteOrder = async (orderId) => {
//     const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?');
//     if (!confirmDelete) return;

//     try {
//       await deleteDoc(doc(db, 'orders', orderId));
//       alert('Xóa đơn hàng thành công!');
//       // Không cần cập nhật state thủ công vì onSnapshot sẽ tự động cập nhật
//     } catch (error) {
//       console.error('Lỗi khi xóa đơn hàng:', error);
//       alert('Có lỗi xảy ra khi xóa đơn hàng. Vui lòng thử lại!');
//     }
//   };

//   // Nhóm các đơn hàng theo ngày
//   const groupOrdersByDate = () => {
//     const groupedOrders = {};
//     orders.forEach(order => {
//       const date = order.timestamp instanceof Date && !isNaN(order.timestamp)
//         ? order.timestamp.toLocaleDateString('vi-VN')
//         : 'Ngày không xác định';
//       if (!groupedOrders[date]) {
//         groupedOrders[date] = [];
//       }
//       groupedOrders[date].push(order);
//     });

//     // Sắp xếp các ngày theo thứ tự giảm dần
//     const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
//       if (a === 'Ngày không xác định') return 1;
//       if (b === 'Ngày không xác định') return -1;
//       return new Date(b) - new Date(a);
//     });

//     const sortedGroupedOrders = {};
//     sortedDates.forEach(date => {
//       sortedGroupedOrders[date] = groupedOrders[date];
//     });

//     return sortedGroupedOrders;
//   };

//   const groupedOrders = groupOrdersByDate();

//   return (
//     <div className="App">
//       <h1>Quản lý đơn hàng</h1>
//       {Object.keys(groupedOrders).length === 0 ? (
//         <p>Chưa có đơn hàng nào.</p>
//       ) : (
//         Object.keys(groupedOrders).map(date => (
//           <div key={date} className="date-group">
//             <h2 className="date-header">{date}</h2>
//             {groupedOrders[date].map(order => (
//               <div key={order.id} className="order">
//                 <div className="order-details">
//                   <p>Người đặt: {order.userName || 'Chưa có tên'}</p>
//                   <p>Đơn hàng: {order.items.map(item => item.name).join(', ')}</p>
//                   <p>Tổng: {order.total.toLocaleString()}đ</p>
//                   <p>Thời gian: {order.timestamp instanceof Date && !isNaN(order.timestamp) ? order.timestamp.toLocaleString('vi-VN') : 'Không xác định'}</p>
//                   <p>Trạng thái: {order.status}</p>
//                 </div>
//                 <div className="order-actions">
//                   <select
//                     value={order.status}
//                     onChange={(e) => updateOrderStatus(order.id, e.target.value)}
//                     disabled={order.status === 'Đã hủy'}
//                   >
//                     <option value="Đã nhận">Đã nhận</option>
//                     <option value="Đang làm">Đang làm</option>
//                     <option value="Đã thanh toán">Đã thanh toán</option>
//                   </select>
//                   {order.status !== 'Đã hủy' && (
//                     <button
//                       className="cancel-button"
//                       onClick={() => cancelOrder(order.id)}
//                     >
//                       Hủy món
//                     </button>
//                   )}
//                   {order.status === 'Đã hủy' && (
//                     <button
//                       className="delete-button"
//                       onClick={() => deleteOrder(order.id)}
//                     >
//                       Xóa
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default App;



// Đăng nhập
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import Modal from 'react-modal';
import './App.css';

Modal.setAppElement('#root'); // Đặt root element cho modal

const App = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null); // Trạng thái người dùng
  const [email, setEmail] = useState(''); // Email nhập vào
  const [password, setPassword] = useState(''); // Mật khẩu nhập vào
  const [error, setError] = useState(''); // Lưu lỗi nếu có
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const auth = getAuth();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null); // Đảm bảo set null nếu không có user
      }
      setLoading(false); // Kết thúc loading khi xác thực xong
    });

    // Lấy dữ liệu đơn hàng nếu đã đăng nhập
    if (user) {
      const ordersCollection = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
      const unsubscribeOrders = onSnapshot(ordersCollection, (snapshot) => {
        const ordersList = snapshot.docs.map(doc => {
          const data = doc.data();
          let timestamp = data.timestamp;
          console.log('Raw timestamp from Firestore:', timestamp);
          if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp);
            console.log('Parsed Date from ISO:', timestamp);
          } else if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
            timestamp = timestamp.toDate();
            console.log('Parsed Date from Firestore Timestamp:', timestamp);
          } else {
            console.warn('Invalid timestamp for order ID:', doc.id, 'Value:', timestamp);
            timestamp = null;
          }
          return { id: doc.id, ...data, timestamp };
        });
        setOrders(ordersList);
        console.log('Processed orders list:', ordersList);
      }, (error) => {
        console.error('Lỗi khi lấy dữ liệu:', error.message);
        alert('Có lỗi xảy ra khi lấy danh sách đơn hàng: ' + error.message);
      });

      return () => {
        unsubscribeOrders();
        unsubscribeAuth();
      };
    }

    return () => unsubscribeAuth();
  }, [user, auth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(''); // Reset email
      setPassword(''); // Reset password
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.message);
      setError('Đăng nhập thất bại. Kiểm tra email hoặc mật khẩu!');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!user) return; // Chỉ cho phép nếu đã đăng nhập
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });
  };

  const cancelOrder = async (orderId) => {
    if (!user) return;
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
    if (!user) return;
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      alert('Xóa đơn hàng thành công!');
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
      ) : !user ? (
        <Modal
          isOpen={true}
          onRequestClose={() => {}}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              width: '350px',
              padding: '25px',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
          }}
        >
          <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px', fontWeight: 'bold' }}>Đăng nhập Admin</h2>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email..."
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label>Mật khẩu:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background 0.3s',
                width: '100%',
              }}
              onMouseOver={(e) => (e.target.style.background = '#0056b3')}
              onMouseOut={(e) => (e.target.style.background = '#007bff')}
            >
              Đăng nhập
            </button>
          </form>
        </Modal>
      ) : (
        <>
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
                        <option value="Đã thanh toán">Đã thanh toán</option>
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
        </>
      )}
    </div>
  );
};

export default App;
