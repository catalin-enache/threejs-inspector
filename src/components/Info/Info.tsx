import './Info.css';
interface InfoProps {
  label?: string;
  value?: string;
  className?: string;
}
export const Info = (props: InfoProps) => {
  const { label = '', className = '', value = '' } = props;

  return (
    <div className={`info ${className}`}>
      <div className="info__label">{label}</div>
      <div className="info__value">{value}</div>
    </div>
  );
};
