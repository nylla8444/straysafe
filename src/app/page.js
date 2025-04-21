export default async function Home() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the main page of your application.</p>
    </div>
  );

}


// async function getAllUsers() {
//   let response = await fetch("http://localhost:3000/api/users", {
//     cache: "no-store",
//   })

//   response = await response.json()
//   return response
// }




// // =========================================== //
// export default async function Home() {


//   const allData = await getAllUsers()
//   // console.log(allData)

//   if (allData != null) {
//     const users = allData
//     // console.log("users\n", users)

//     return (
//       <>
//         <h1>test crud</h1>

//         {/* display data here */}

//         <section>
//           <div className="container">
//             <div className="row">
//               <div className="col-lg-8 col-md-12 col-sm-12 col-12 mx-auto">

//                 <table className="table">
//                   <thead>
//                     <tr>
//                       <th>ID</th>
//                       <th>Name</th>
//                       <th>Phone Number</th>
//                       <th>Email</th>
//                       <th>Created At</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {users.map((user) => (
//                       <tr key={user._id}>
//                         <td>{user.user_id}</td>
//                         <td>{user.name}</td>
//                         <td>{user.phone}</td>
//                         <td>{user.email}</td>
//                         <td>{user.created_at}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </section>
//       </>
//     )
//   } else {
//     return (
//       <div>
//         No data found
//       </div>
//     )
//   }
// }


