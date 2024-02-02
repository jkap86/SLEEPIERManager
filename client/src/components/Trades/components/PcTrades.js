import { useSelector, useDispatch } from "react-redux";
import LoadingIcon from "../../Common/LoadingIcon";
import TableMain from "../../Common/TableMain";
import Trade from "./Trade";
import Search from "../../Common/Search";
import { setStateTrades, fetchPriceCheckTrades } from "../redux/actions";
import useFetchPcTrades from "../services/hooks/useFetchPcTrades";
import { position_map } from "../../PlayoffPool/helpers/getWeeklyResult";

const PcTrades = ({ trades_headers, players_list, secondaryTable }) => {
  const dispatch = useDispatch();
  const { allplayers } = useSelector((state) => state.common);
  const { adpLm } = useSelector((state) => state.user);
  const { isLoading, pricecheckTrades } = useSelector((state) => state.trades);

  const search = pricecheckTrades.searches.find(
    (pcTrade) =>
      pcTrade.pricecheck_player === pricecheckTrades.pricecheck_player.id &&
      pcTrade.pricecheck_player2 === pricecheckTrades.pricecheck_player2.id
  );

  const tradesDisplay = search?.trades || [];

  const tradeCount = search?.count;

  const trades_body = tradesDisplay
    ?.sort((a, b) => parseInt(b.status_updated) - parseInt(a.status_updated))
    ?.map((trade) => {
      const rosters = Object.values(trade.rosters).map((roster) => {
        const starters = [];

        trade["league.roster_positions"]
          .filter((slot) => Object.keys(position_map).includes(slot))
          .forEach((slot) => {
            const league_type =
              trade["league.settings"].type === 2
                ? "Dynasty"
                : trade["league.settings"].type === 0
                ? "Redraft"
                : "All";

            const players_slot = roster.players
              ?.filter(
                (player_id) =>
                  position_map[slot].some((p) =>
                    allplayers[player_id]?.fantasy_positions?.includes(p)
                  ) && !starters.includes(player_id)
              )
              ?.sort(
                (a, b) =>
                  (adpLm?.[league_type]?.[a]?.adp || 999) -
                  (adpLm?.[league_type]?.[b]?.adp || 999)
              );

            starters.push(players_slot?.[0] || "0");
          });

        return {
          ...roster,
          starters: starters,
        };
      });

      const league = {
        avatar: trade["league.avatar"],
        league_id: trade["league.league_id"],
        name: trade["league.name"],
        roster_positions: trade["league.roster_positions"],
        scoring_settings: trade["league.scoring_settings"],
        settings: trade["league.settings"],
      };

      return {
        id: trade.transaction_id,
        list: [
          {
            text: <Trade trade={trade} />,
            colSpan: 10,
          },
        ],
        secondary_table: secondaryTable({ rosters, league, trade }),
      };
    });

  useFetchPcTrades();

  const loadMore = async () => {
    console.log("LOADING MORE");

    dispatch(
      fetchPriceCheckTrades(
        pricecheckTrades.pricecheck_player.id,
        pricecheckTrades.pricecheck_player2.id,
        tradesDisplay.length,
        125
      )
    );
  };

  return (
    <>
      <h1>{tradeCount?.toLocaleString("en-US")} Trades</h1>
      <div className="trade_search_wrapper">
        <Search
          id={"By Player"}
          placeholder={`Player`}
          list={players_list}
          searched={pricecheckTrades.pricecheck_player}
          setSearched={(searched) =>
            dispatch(
              setStateTrades({
                pricecheckTrades: {
                  ...pricecheckTrades,
                  pricecheck_player: searched,
                },
              })
            )
          }
        />
        {!pricecheckTrades.pricecheck_player?.id ? null : (
          <>
            <Search
              id={"By Player"}
              placeholder={`Player`}
              list={players_list}
              searched={pricecheckTrades.pricecheck_player2}
              setSearched={(searched) =>
                dispatch(
                  setStateTrades({
                    pricecheckTrades: {
                      ...pricecheckTrades,
                      pricecheck_player2: searched,
                    },
                  })
                )
              }
            />
          </>
        )}
      </div>
      {isLoading ? (
        <LoadingIcon />
      ) : (
        <TableMain
          id={"trades"}
          type={"primary trades"}
          headers={trades_headers}
          body={trades_body}
          itemActive={pricecheckTrades.itemActive}
          setItemActive={(item) =>
            dispatch(
              setStateTrades({
                pricecheckTrades: { ...pricecheckTrades, itemActive: item },
              })
            )
          }
          page={pricecheckTrades.page}
          setPage={(page) =>
            dispatch(
              setStateTrades({
                pricecheckTrades: { ...pricecheckTrades, page: page },
              })
            )
          }
          partial={tradesDisplay?.length < tradeCount ? true : false}
          loadMore={loadMore}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
export default PcTrades;
