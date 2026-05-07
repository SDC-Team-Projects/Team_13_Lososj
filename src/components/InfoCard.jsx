import React, { useEffect, useState } from "react";
import "../css/InfoCard.css";


export default function InfoCard ({title = "Title", count = 0}) {
    return (
        <div className="infoCard">
            <div className="title">{title}</div>
            <div className="count">{count}</div>
        </div>
    )
}