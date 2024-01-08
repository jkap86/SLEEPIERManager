import Leagues1 from "./components/Leagues1";
import Leagues2 from "./components/Leagues2";

const Leagues = () => {

    return <Leagues1
        secondaryTable={
            (props) => <Leagues2 {...props} />
        }
    />
}

export default Leagues;