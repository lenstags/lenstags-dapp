import React, { useState } from "react";

const TagsSection = () => {
  const [tags, setTags] = useState<string[]>(["NTF Gaming"]);

  const handleKeyDown = (event: any) => {
    const { value } = event.target;

    if (event.key === "Enter" && value) {
      setTags((prevTags) => [...prevTags, value]);
    }
  };

  const handleRemoveTag = (tagToDelete: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToDelete));
  };

  return (
    <>
      <div className=" w-full mx-auto  mt-2 mb-5 relative">
        <div className="relative">
          <svg
            className="absolute z-20 cursor-pointer top-[18px] left-4"
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.2716 13.1684L11.3313 10.2281C12.0391 9.28574 12.4213 8.13865 12.42 6.96C12.42 3.94938 9.97063 1.5 6.96 1.5C3.94938 1.5 1.5 3.94938 1.5 6.96C1.5 9.97063 3.94938 12.42 6.96 12.42C8.13865 12.4213 9.28574 12.0391 10.2281 11.3313L13.1684 14.2716C13.3173 14.4046 13.5114 14.4756 13.711 14.47C13.9105 14.4645 14.1004 14.3827 14.2415 14.2415C14.3827 14.1004 14.4645 13.9105 14.47 13.711C14.4756 13.5114 14.4046 13.3173 14.2716 13.1684ZM3.06 6.96C3.06 6.18865 3.28873 5.43463 3.71727 4.79328C4.14581 4.15192 4.7549 3.65205 5.46754 3.35687C6.18017 3.06169 6.96433 2.98446 7.72085 3.13494C8.47738 3.28542 9.17229 3.65686 9.71772 4.20228C10.2631 4.74771 10.6346 5.44262 10.7851 6.19915C10.9355 6.95567 10.8583 7.73983 10.5631 8.45247C10.268 9.1651 9.76808 9.77419 9.12673 10.2027C8.48537 10.6313 7.73135 10.86 6.96 10.86C5.92604 10.8588 4.93478 10.4475 4.20365 9.71635C3.47253 8.98522 3.06124 7.99396 3.06 6.96Z"
              fill="#4B5563"
            />
          </svg>
          <input
            className="relative text-sm leading-none text-gray-600 bg-white rounded  w-full px-10 py-4 outline-none"
            type="text"
            name="tag-search-input"
            id="tag-search-input"
            onKeyDown={handleKeyDown}
            placeholder="Search tags..."
          />
        </div>
        <div className="relative bg-white px-4  py-3 border-t border-b border-gray-200 flex gap-x-4 flex-wrap gap-y-4">
          {tags.map((tag, idx) => (
            <div
              className="text-xs leading-3 text-black pr-8 pl-6 py-1 w-content h-6 bg-greenLengs  rounded-none relative"
              key={`tag-${idx}`}
            >
              {tag}
              <div
                className="absolute right-2 top-[4px] cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              >
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.92821 7.00016L10.5259 4.40251C10.6491 4.27944 10.7185 4.11244 10.7186 3.93824C10.7188 3.76405 10.6498 3.59692 10.5267 3.47364C10.4036 3.35035 10.2366 3.28101 10.0624 3.28085C9.88823 3.2807 9.7211 3.34975 9.59782 3.47282L7.00016 6.07047L4.40251 3.47282C4.27922 3.34953 4.11201 3.28027 3.93766 3.28027C3.76331 3.28027 3.5961 3.34953 3.47282 3.47282C3.34953 3.5961 3.28027 3.76331 3.28027 3.93766C3.28027 4.11201 3.34953 4.27922 3.47282 4.40251L6.07047 7.00016L3.47282 9.59782C3.34953 9.7211 3.28027 9.88831 3.28027 10.0627C3.28027 10.237 3.34953 10.4042 3.47282 10.5275C3.5961 10.6508 3.76331 10.72 3.93766 10.72C4.11201 10.72 4.27922 10.6508 4.40251 10.5275L7.00016 7.92985L9.59782 10.5275C9.7211 10.6508 9.88831 10.72 10.0627 10.72C10.237 10.72 10.4042 10.6508 10.5275 10.5275C10.6508 10.4042 10.72 10.237 10.72 10.0627C10.72 9.88831 10.6508 9.7211 10.5275 9.59782L7.92821 7.00016Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>
        {`
        body{
          background:rgb(243 244 246);
        }
        `}
      </style>
    </>
  );
};

export default TagsSection;
