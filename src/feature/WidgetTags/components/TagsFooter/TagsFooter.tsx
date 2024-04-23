import { FaInfoCircle } from "react-icons/fa";

import style from "./TagsFooter.module.css";

export const TagsFooter = () => {
  return (
    <>
      <div className={style.tagsRating}>
        <span>Słabo</span>
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <div className={style.tagsInfo}>
        <FaInfoCircle />
        <p>
          Lorem ipsum dolor sit amet, consecteapien risus, malesuada id mattis.{" "}
        </p>
      </div>
    </>
  );
};
