import "../styles/Logo.scss";

const Logo = () => {
  return (
    <div className="logo">
      <div className="logo-inner">
        <div className="logo-square top-left"></div>
        <div className="logo-square top-right"></div>
        <div className="logo-square bottom-left"></div>
        <div className="logo-square bottom-right"></div>
      </div>
    </div>
  );
};

export default Logo;
