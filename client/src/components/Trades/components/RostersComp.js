import Roster from "../../Common/Roster";

const RostersComp = ({ rosters, league, type }) => {
  return (
    <>
      <Roster roster={rosters[0]} league={league} type={type} />
      <Roster roster={rosters[1]} league={league} type={type} />
    </>
  );
};

export default RostersComp;
