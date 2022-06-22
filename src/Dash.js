import React, { FC, useState, useEffect } from 'react'
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi'
import { Alert, Button } from 'antd'
// import { generateFetchRequest } from 'clients/fetch'
// import { gql } from '@apollo/client'
// import apolloClient from 'clients/apollo'
// import ImageButton from 'atmos-ui/elements/ImageButton'
// import AtmosButton from 'atmos-ui/elements/AtmosButton';

// const GET_NONCE = gql`
//   query fetchNonce {
//     fetchNonce
//   }
// `

const getNonce = async () => {
  let nonceValue = ''

  // try {
  //   const {
  //     data: { fetchNonce: nonce },
  //   } = await apolloClient.query({ query: GET_NONCE })
  //   nonceValue = nonce
  // } catch (e) {
  //   console.error(e)

  //   nonceValue = Math.random().toString(16).slice(2)
  // }

  return nonceValue
}

const WalletConnectButton = ({ size, setUserId, onStepSatisfied, onStepDissatisfied, onLoginSuccess }) => {
  const [isDisabled, setDisabled] = useState(false)
  const [nonceMessage, setNonceMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { data: accountData } = useAccount()
  const { disconnect } = useDisconnect()

  React.useEffect(() => {
    getNonce().then(function (nonce) {
      setNonceMessage(
        "Welcome Pilot,\n\nSign this message to prove you have access to this wallet and we'll log you in. This won't cost yo Ether.\n\n" +
          "To stop hackers from using your wallet, here's a unique message ID they can't guess: \n" +
          `${nonce}`
      )
    })

    // If metamask account is not connected, but wagmi cache stores the stale connection to account, disconnect it.
    if (!activeConnector) {
      disconnect()
    }
  }, [])

  const { activeConnector, connectAsync, connectors, connect, isConnecting, pendingConnector } = useConnect({
    onConnect: async connector => {
      setDisabled(true)
      await signMessageAsync()
    },
    onError: error => {
      console.log('connection error', error)

      switch (error.code) {
        case -32002:
          setErrorMessage(
            'There is a pending wallet connect request.\n\nPlease check your wallet to respond to that request before proceeding.'
          )
          setDisabled(true)
          break
        default:
          setErrorMessage(error.message)
      }
    },
  })
  // const recoveredAddress = React.useRef<string>();
  const {
    isError: isSignError,
    error: signError,
    signMessageAsync,
    isLoading: isSignLoading,
  } = useSignMessage({
    message: nonceMessage,
    onError(error) {
      console.error('Error signing message: ', error.message)
      setErrorMessage(error.message)
      connectAsync()
      setDisabled(false)
    },
    async onSuccess(data, variables) {
      // console.log('Verifying signature...');
      // recoveredAddress.current = verifyMessage(variables.message, data);
      // console.log('Recovered Address: ', recoveredAddress.current);
      // console.log('data', data);
      setErrorMessage('')
      await registerUserAccount(accountData.address, variables.message, data)

      // if (recoveredAddress.current === accountData.address) {
      //   console.log('Signature verified!');
      //   // onStepSatisfied()
      // } else {
      //   console.log('Signature verification failed!');
      //   console.log('Expected Address: ', accountData.address);
      //   console.log('Recovered Address: ', recoveredAddress.current);
      //   onStepDissatisfied();
      // }
    },
  })

  const registerUserAccount = async (address, message, data) => {
    console.log('Registering user account...')

    // const request = generateFetchRequest({
    //   method: 'POST',
    //   path: 'users/auth/web3/callback.json',
    //   body: JSON.stringify({
    //     omniauth: { provider: 'web3', uid: address, info: { message: message, signature: data } },
    //   }),
    // })

    // try {
    //   const result = await fetch(request)
    //   const data = await result.json()

    //   if (result.ok) {
    //     setErrorMessage('')
    //     if (data.confirmed) onLoginSuccess()
    //     else {
    //       setUserId(data.id)
    //       onStepSatisfied()
    //     }
    //   } else {
    //     throw new Error(data.errors)
    //   }
    // } catch (fetchError) {
    //   if (fetchError && fetchError.message) {
    //     console.log('Failed to register user account1: ', fetchError.message)
    //     setErrorMessage(fetchError.message)
    //   } else {
    //     console.log('Failed to register user account2: ', fetchError)
    //     setErrorMessage(fetchError)
    //   }
    //   onStepDissatisfied()
    // }
  }

  const getWalletDisplay = address => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4)
  }

  if (accountData) {
    return (
      <>
        {/* <Alert type='info' message="To verify wallet owernship, click Verify Ownership." /> */}
        <Alert type='warning' message='To use a different account please select it from your wallet now.' />
        <div className='wallet-connector-btns'>
          <Button disabled={isSignLoading} onClick={async () => await signMessageAsync()} className='meta-mask-button'>
            <img src='/images/crypto/meta-mask-logo.png' alt='MetaMask' style={{ height: 30, marginRight: 10 }} />
            {isSignLoading ? 'Requesting Signature' : `Verify ${getWalletDisplay(accountData.address)}`}
          </Button>
        </div>
        {isSignError && <Alert type='error' message={signError.message} />}
      </>
    )
  }
  console.log(connectors)

  return (
    <div className='wallet-connector-btns'>
      <div>
        {connectors.map(connector => {
          return (
            <Button
              key={connector.id}
              size={size}
              className='meta-mask-button'
              onClick={async () => {
                if (connector.name == 'Injected') {
                  window.open('https://metamask.io/download/', '_blank')
                } else {
                  setErrorMessage('')
                  connect(connector)
                  // await connectAsync(connector)
                }
              }}
              disabled={isDisabled || isConnecting}
            >
              <img src='/images/crypto/meta-mask-logo.png' alt='MetaMask' style={{ height: 30, marginRight: 10 }} />
              {isConnecting && connector.id === pendingConnector?.id
                ? 'Requesting Connection'
                : connector.name !== 'Injected'
                ? connector.name
                : 'Download MetaMask'}
            </Button>
          )
        })}
      </div>
      {errorMessage && <Alert message={errorMessage} type='error' />}
    </div>
  )
}

export default WalletConnectButton
