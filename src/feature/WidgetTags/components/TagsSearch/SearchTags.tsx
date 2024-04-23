import { FaMagnifyingGlass } from "react-icons/fa6";
import { useState } from "react";
import { tags } from "types";

import style from "./SearchTags.module.css";

const mockTags: tags[] = [
  { id: "1", name: "Kabaret Skeczów Męczących", size: "+32", checked: false },
  { id: "2", name: "Kabaret Moralnego Niepokoju", size: "+32", checked: false },
  { id: "3", name: "Krzysztof Piasecki", size: "+32", checked: false },
  { id: "4", name: "Marek Kondrat", size: "+32", checked: false },
  { id: "5", name: "Michał Leja ", size: "+32", checked: false },
  { id: "6", name: "Piotr Bałtroczyk", size: "+32", checked: false },
  { id: "7", name: "Tomasz Jachimek", size: "+32", checked: false },
  { id: "8", name: "Andrzej Poniedzielski", size: "+32", checked: false },
  { id: "9", name: "Jerzy Kryszak", size: "+32", checked: false },
  { id: "10", name: "Mariusz Kałamaga", size: "+32", checked: false },
];

type SearchTagsProps = {
  setTags: React.Dispatch<React.SetStateAction<tags[]>>;
};

export const SearchTags = ({ setTags }: SearchTagsProps) => {
  const [searchTagText, setSearchTagText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownTags, setDropdownTags] = useState(mockTags);

  const handleCheckbox = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    setDropdownTags((tags) =>
      tags.map((tag) =>
        tag.id === id ? { ...tag, checked: e.target.checked } : tag
      )
    );
  };

  return (
    <>
      <div className={style.search}>
        <FaMagnifyingGlass />
        <input
          data-testid="search-input"
          value={searchTagText}
          onClick={() => setShowDropdown(!showDropdown)}
          onChange={(e) => {
            setSearchTagText(e.target.value);
          }}
          placeholder="Wyszukaj grupę lub tag"
        />
      </div>

      {showDropdown && (
        <div className={style.searchDropdown}>
          <ul>
            {dropdownTags
              .filter((tag) => tag.name.includes(searchTagText))
              .map((tag) => (
                <li key={tag.id}>
                  <input
                    data-testid="search-item-checkbox"
                    type="checkbox"
                    checked={tag.checked}
                    onChange={(e) => {
                      handleCheckbox(e, tag.id);
                    }}
                  />
                  <div>{tag.name}</div>
                  <span>{tag.size}</span>
                </li>
              ))}
          </ul>
          <button
            date-testid="search-submit-btn"
            onClick={() => {
              setTags(dropdownTags.filter((tag) => tag.checked));
              setShowDropdown(false);
            }}
          >
            Zapisz
          </button>
        </div>
      )}
    </>
  );
};
