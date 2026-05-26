// import "../css/UniversalGrid.css";

// export default function UniversalGrid({
//   columns = 3,
//   children,
// }) {
//   return (
//     <div
//       className={`grid cols-${columns}`}
//       style={{
//         gridTemplateColumns: `repeat(${columns}, minmax(0, 340px))`,
//       }}
//     >
//       {children}
//     </div>
//   );
// }


import "../css/UniversalGrid.css";

export default function UniversalGrid({
  columns = 3,
  children,
}) {
  return (
    <div className={`grid cols-${columns}`}>
      {children}
    </div>
  );
}