import React, { useState } from "react";
const Index = () => {
    const [activeStatus, setActiveStatus] = useState(1);

    return (
        <div className="justify-between flex-wrap hidden sm:block bg-greenLengs rounded-none shadow mb-5">
            <div className="xl:w-full xl:mx-0 pl-5 pr-5 h-12">
                <ul className="flex">
                    <li onClick={() => setActiveStatus(1)} className={activeStatus == 1 ? "text-sm text-black font-semibold flex flex-col justify-between border-indigo-700 pt-3 rounded-t mr-10 " : "text-sm text-gray-600 py-3 mr-10 font-normal cursor-pointer hover:text-gray-800"}>
                        <span className="mb-3 cursor-pointer">{activeStatus == 1 ? "My Post" : "My Post"}</span>
                        {activeStatus == 1 && <div className="w-full h-1 bg-black rounded-none" />}
                    </li>
                    <li onClick={() => setActiveStatus(2)} className={activeStatus == 2 ? "text-sm text-black font-semibold flex flex-col justify-between border-indigo-700 pt-3 rounded-t mr-10 " : "text-sm text-gray-600 py-3 mr-10 font-normal cursor-pointer hover:text-gray-800"}>
                        <span className="mb-3 cursor-pointer">{activeStatus == 2 ? "Collected" : "Collected"}</span>
                        {activeStatus == 2 && <div className="w-full h-1 bg-black rounded-none" />}
                    </li>
                    <li onClick={() => setActiveStatus(3)} className={activeStatus == 3 ? "text-sm text-black font-semibold flex flex-col justify-between border-indigo-700 pt-3 rounded-t mr-10 " : "text-sm text-gray-600 py-3 mr-10 font-normal cursor-pointer hover:text-gray-800"}>
                        <span className="mb-3 cursor-pointer">{activeStatus == 3 ? "Drops" : "Drops"}</span>
                        {activeStatus == 3 && <div className="w-full h-1 bg-black rounded-none hover:bg-greenLengs" />}
                    </li>
                </ul>
            </div>
        </div>
    );
};
export default Index;