import sleeperlogo from '../../../images/sleeper_icon.png';
import './LoadingIcon.css';

const LoadingIcon = () => {


    return <div className='loading'>
        <img
            className="loading"
            src={sleeperlogo}
            alt={'logo'}
        />
        <div className='z_one'>
            Z
        </div>
        <div className='z_two'>
            Z
        </div>
        <div className='z_three'>
            Z
        </div>
    </div>
}

export default LoadingIcon;