import './Info.css';
interface InfoProps {
  label?: string;
  value?: string;
  className?: string;
  inline?: boolean;
}
export const Info = (props: InfoProps) => {
  const { label = '', className = '', value = '', inline = false } = props;

  return (
    <div className={`info ${className} ${inline ? 'inline' : ''}`}>
      <div className="info__label">{label}</div>
      <div className="info__value">{value}</div>
    </div>
  );
};
