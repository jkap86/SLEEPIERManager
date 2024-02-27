const HeaderDropdown = ({ column_text, columnOptions, setState }) => {
  return (
    <p className="option">
      {column_text}
      <select
        value={column_text}
        className="hidden_behind click"
        onChange={(e) => setState(e.target.value)}
      >
        {columnOptions.map((column) => {
          return <option key={column}>{column}</option>;
        })}
      </select>
    </p>
  );
};

export default HeaderDropdown;
