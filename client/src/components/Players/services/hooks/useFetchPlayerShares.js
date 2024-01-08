import { useEffect } from "react";
import { fetchPlayerShares } from "../../../Players/redux/actions";
import { useSelector, useDispatch } from "react-redux";


const useFetchPlayerShares = () => {
    const dispatch = useDispatch();
    const { user_id, leagues } = useSelector(state => state.user);
    const { userPlayerShares } = useSelector(state => state.players);


    useEffect(() => {
        if (leagues && !userPlayerShares) {
            console.log('dispatching fetch ps')
            dispatch(fetchPlayerShares(leagues, user_id))

        }
    }, [dispatch, user_id, leagues, userPlayerShares])

}

export default useFetchPlayerShares;