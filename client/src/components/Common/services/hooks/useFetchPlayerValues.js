import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchPlayerValues } from "../../redux/actions";


const useFetchPlayerValues = ({ player_ids }) => {
    const dispatch = useDispatch();


    useEffect(() => {
        if (player_ids.length > 0) {
            dispatch(fetchPlayerValues(player_ids))
        }
    }, [player_ids, dispatch])

}

export default useFetchPlayerValues;