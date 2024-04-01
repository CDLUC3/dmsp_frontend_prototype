function ConfirmUser(props) {
    return (
        <form className="max-w-lg w-full bg-gray-100 shadow-lg p-8 flex flex-col">
        <p className="text-xl mb-4 text-center">Verify your email</p>
      
        <label htmlFor="verificationCode">Verification code</label>
        <input
          id="verificationCode"
          value={props.verificationCode}
          type="text"
          className="border py-2 px-4 border-gray-500 focus:outline-none mb-4"
          onChange={(e) => props.setVerificationCode(e.target.value)}
        />
      
        <button
          className="mt-3 text-lg font-semibold py-4 px-4 bg-gray-600 text-gray-200"
          type="submit"
          onClick={props.handleConfirmSignUp}
        >
          Confirm
        </button>
        </form>
    )
}

export default ConfirmUser;