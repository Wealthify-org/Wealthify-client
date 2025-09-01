import ErrorNotification from "../errorNotification/ErrorNotification"
import classes from './RegistrationModal.module.css'

type RegistrationModalProps = {
  children: React.ReactNode
  isVisible: boolean
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>> 
  errorMessage: string
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
}

const RegistrationModal = ({children, isVisible, setIsVisible, errorMessage, setErrorMessage}: RegistrationModalProps) => {
  return (
    <div 
      className={`${classes.modal} ${isVisible ? classes.active : ''}`}
      aria-hidden={!isVisible}
      onClick={() => setIsVisible(false)}
    >
      <div className={classes.modalWrapper}>
        <ErrorNotification message={errorMessage} setErrorMessage={setErrorMessage} />
        <div 
          className={classes.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>     
    </div>
  )
}

export default RegistrationModal