import { IoMdClose } from "react-icons/io";
import { tags } from "types";
import style from "./TagList.module.css";

type TagListProps = {
  tags: tags[];
  setTags: React.Dispatch<React.SetStateAction<tags[]>>;
};

export const TagsList = ({ tags, setTags }: TagListProps) => {
  const handleRemove = (id: string) => {
    setTags((tags) => tags.filter((item) => item.id !== id));
  };

  return (
    <div className={style.tagList} data-testid="tags-list">
      {tags.map((tag) => (
        <li key={tag.id}>
          {tag.name}{" "}
          <IoMdClose
            data-testid="tags-list-close-item"
            onClick={() => handleRemove(tag.id)}
          />
        </li>
      ))}
    </div>
  );
};
