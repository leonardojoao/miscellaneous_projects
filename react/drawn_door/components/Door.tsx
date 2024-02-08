import styles from "../styles/Door.module.css";
import DoorModel from "../model/door";

interface DoorProps {
  value: DoorModel;
  onChange: (newDoor: DoorModel) => void;
}

export default function Door(props: DoorProps) {
  const door = props.value;
  const selected = door.selected ? styles.selected : "";

  const changeSelected = (e) => props.onChange(door.select());
  const open = (e) => {
    e.stopPropagation();
    props.onChange(door.open());
  };

  function renderDoor() {
    return (
      <div className={styles.door}>
        <div className={styles.number}>{door.number}</div>
        <div className={styles.doorknob} onClick={open}></div>
      </div>
    );
  }

  return (
    <div className={styles.area} onClick={changeSelected}>
      <div className={`${styles.border} ${selected}`}>
        {door.opened ? false : renderDoor()}
      </div>

      <div className={styles.botton}></div>
    </div>
  );
}
