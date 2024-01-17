"use client";
import styles from "./page.module.css";
import Door from "../components/Door";
import DoorModel from "../model/door";
import { React, useState } from "react";

export default function Home() {
  const [door_1, setDoor_1] = useState(new DoorModel(1));

  return (
    <main
      className={styles.main}
      style={{ display: "flex", flexDirection: "row" }}
    >
      <Door value={door_1} onChange={(newDoor) => setDoor_1(newDoor)} />
    </main>
  );
}
