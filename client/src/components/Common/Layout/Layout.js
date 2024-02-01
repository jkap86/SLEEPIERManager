import useFetchUserInfo from "../services/hooks/useFetchUserInfo";
import Heading from "../Heading";
import { useSelector } from "react-redux";
import LoadingIcon from "../LoadingIcon";

const Layout = ({ display }) => {
  const progress = useSelector((state) => state.progress.progress);
  const { isLoadingUser, isLoadingLeagues, errorUser } = useSelector(
    (state) => state.user
  );

  useFetchUserInfo([]);

  return (
    <>
      <Heading progress={progress} />
      {isLoadingUser || isLoadingLeagues ? (
        <LoadingIcon />
      ) : (
        (errorUser.error && <h1 className="error">{errorUser.error}</h1>) ||
        display
      )}
    </>
  );
};

export default Layout;
