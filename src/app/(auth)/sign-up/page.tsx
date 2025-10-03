import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import AbstractBackgroundShapes from "@/components/UI/abstractBackgroundShapes/AbstractBackgroundShapes";
import classes from '@/components/UI/registrationModal/RegistrationModal.module.css'

export default function SignUpPage() {
  return (
    <>
      <div className={[classes.modal, classes.active, classes.visible].join(' ')}>
        <div className={classes.modalWrapper}>
          <div className={classes.modalContent}>
            <SignUpForm variant="page"/>
          </div>
        </div>
      </div>
      <AbstractBackgroundShapes />
    </>
  )
}