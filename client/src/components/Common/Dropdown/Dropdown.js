import React from "react";
import Avatar from "../Avatar/Avatar";
import { useDispatch } from "react-redux";

const Dropdown = React.forwardRef(({ dropdownOptions, visibleState, setState }, ref) => {
    const dispatch = useDispatch();

    return <div className='dropdown_wrapper'>
        <p className='dropdown_header'>Top League Counts</p>
        <ol
            onBlur={() => dispatch(setState({ [visibleState]: false }))}
            className="dropdown"
            ref={ref}
        >
            {dropdownOptions
                .sort((a, b) => parseInt(b.leaguesCount) - parseInt(a.leaguesCount))
                .map((option, index) =>
                    <li key={`${option.username}_${index}`}>
                        <button>
                            {
                                <>
                                    <p>
                                        <span className='leagues_count'>
                                            {index + 1}
                                        </span>
                                        <span className='username'>
                                            {
                                                <Avatar
                                                    avatar_id={option.avatar}
                                                    alt={'user avatar'}
                                                    type={'user'}
                                                />

                                            }
                                            {option.username}
                                        </span>
                                        <span className='leagues_count'>
                                            {option.leaguesCount}
                                        </span>
                                    </p>

                                </>
                            }
                        </button>
                    </li>
                )}
        </ol>
    </div >

})

export default Dropdown;