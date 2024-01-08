import taxi from "../../../images/taxi.png";

const IncludeTaxiFilter = ({ includeTaxi, setIncludeTaxi }) => {
  return (
    <div
      key={"include_taxi"}
      className="relative click"
      onClick={() => setIncludeTaxi(!includeTaxi)}
    >
      <img src={taxi} className="thumbnail icon" alt="include_taxi" />
      {!includeTaxi && <i className="fa-solid fa-ban"></i>}
    </div>
  );
};

export default IncludeTaxiFilter;
