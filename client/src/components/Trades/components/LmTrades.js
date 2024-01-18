import useFetchLmTrades from "../services/hooks/useFetchLmTrades";
import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "../../Common/LoadingIcon";
import TableMain from "../../Common/TableMain";
import Trade from "./Trade";
import { setStateTrades } from "../redux/actions";

const LmTrades = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { lmTrades, isLoading } = useSelector((state) => state.trades);
  const { trades, count, itemActive } = lmTrades;

  useFetchLmTrades();

  const header = [
    [
      {
        text: "Date",
        colSpan: 3,
      },
      {
        text: "League",
        colSpan: 7,
      },
    ],
  ];

  const trades_display = trades || [];

  const body = trades_display
    ?.sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
    ?.map((trade) => {
      return {
        id: trade.transaction_id,
        list: [
          {
            text: <Trade trade={trade} />,
            colSpan: 10,
          },
        ],
        secondary_table: "SEC",
      };
    });

  return isLoading ? (
    <LoadingIcon />
  ) : (
    <TableMain
      type={"primary"}
      headers={header}
      body={body}
      itemActive={itemActive}
      setItemActive={(item) =>
        dispatch(
          setStateTrades({ lmTrades: { ...lmTrades, itemActive: item } })
        )
      }
    />
  );
};

export default LmTrades;
