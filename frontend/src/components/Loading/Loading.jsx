import styles from './Loading.module.css'

const Loading = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenLoader}>
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}

export default Loading
