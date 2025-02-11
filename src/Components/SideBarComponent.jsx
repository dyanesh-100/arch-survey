import React from 'react'

const SideBarComponent = ({groups,selectedGroup,onSelectGroup}) => {
  return (
    <div className="w-1/4 bg-white p-4 shadow-md h-screen overflow-hidden">
      <h2 className="text-lg font-semibold mb-4">Survey Groups</h2>
      <ul>
        {groups.map((group) => (
          <li
            key={group}
            className={`p-2 cursor-pointer ${
              selectedGroup === group ? "bg-blue-500 text-white" : "hover:bg-gray-200"
            } rounded`}
            onClick={() => onSelectGroup(group)}
          >
            {group}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SideBarComponent