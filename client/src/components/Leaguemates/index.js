import Leaguemates1 from "./components/Leaguemates1";
import Leaguemates2 from "./components/Leaguemates2";

const Leaguemates = () => {

    return <Leaguemates1
        secondaryTable={
            (props) => {
                return <Leaguemates2
                    {...props}
                />
            }
        }   
    />
}

export default Leaguemates;