import { useState } from "react";
import { IoMdClose } from "react-icons/io";

import { SearchTags } from "./components/TagsSearch/SearchTags";
import { TagsList } from "./components/TagsList/TagsList";
import { TagsOptions } from "./components/TagsOptions/TagsOptions";
import { TagsFooter } from "./components/TagsFooter/TagsFooter";

import { tags } from "types";

import style from "./WidgetTags.module.css";

export const WidgetTags = () => {
  const [tags, setTags] = useState<tags[]>([]);
  const SuperDuperComponent = () => <div>aaaaa</div>
  return (
    <>
      <SuperDuperComponent/>
      <div className={style.widgetCard}>
        <div className={style.header}>
          <h4>Tagi</h4>
          <div className={style.closeWidget}>
            <IoMdClose />
          </div>
        </div>

        <SearchTags tags={tags} setTags={setTags} />

        {tags.length !== 0 && (
          <>
            <hr className={style.divider} />

            <TagsList tags={tags} setTags={setTags} />
          </>
        )}

        <hr className={style.divider} />

        <TagsOptions />

        <hr className={style.divider} />

        <TagsFooter />
      </div>
    </>
  );
};
