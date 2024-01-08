import Players1 from "./components/Players1";
import Players2 from "./components/Players2";
import Players3 from "./components/Players3";

const Players = () => {

    return <Players1
        secondaryTable={
            (props) =>
                <Players2
                    {...props}
                    secondaryTable={
                        (props2) => {
                            return <Players3
                                {...props2}
                            />
                        }
                    }
                />
        }
    />
}

export default Players;