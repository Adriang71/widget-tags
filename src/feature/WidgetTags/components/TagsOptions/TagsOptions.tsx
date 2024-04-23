import { AiFillContainer } from "react-icons/ai";
import { AiFillTags } from "react-icons/ai";
import { AiOutlineFileText } from "react-icons/ai";

import style from "./TagsOptions.module.css";

export const TagsOptions = () => {
  return (
    <ul className={style.tagsOptions}>
      <li>
        <AiFillContainer />
        CMS AI
      </li>
      <li>
        <AiOutlineFileText />
        Analizuj tekst
      </li>
      <li>
        <AiFillTags />
        Najbardziej Popularne tagi
      </li>
    </ul>
  );
};
