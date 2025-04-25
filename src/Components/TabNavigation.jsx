import React, { forwardRef } from "react";

const TabNavigation = forwardRef(({ groups = [], selectedGroup, onSelectGroup },ref) => {
  return (
    <div ref={ref} className="flex border-b border-gray-300 mb-4 overflow-x-auto no-scrollbar">
      {groups.map((group, index) => (
        <button
          key={`${group}-${index}`} 
          className={`p-3 px-6 whitespace-nowrap transition duration-200 ${
            selectedGroup === group
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-600 hover:text-blue-500 cursor-pointer"
          }`}
          onClick={() => onSelectGroup(group)}
        >
          {group}
        </button>
      ))}
    </div>
  );
});
export default TabNavigation;
