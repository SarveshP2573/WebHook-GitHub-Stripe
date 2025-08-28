import '../styles/showanimation.css'

const SnowAnimation = () => {
  return (
    <div className='snowflakes' aria-hidden='true'>
      {[...Array(30)].map((_, i) => (
        <div key={i} className='snowflake'>
          •
        </div>
      ))}
    </div>
  )
}

export default SnowAnimation
