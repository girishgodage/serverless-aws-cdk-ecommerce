import React, { useEffect, useState, useContext } from 'react'
import { Route, Redirect, useLocation, useHistory } from 'react-router-dom'
import { AppContext, AppProvider } from '@serverless-aws-cdk-ecommerce/react-components'
import { DashboardPage } from './pages/dashboard'
import { ProductPage } from './pages/products'
import { SignInPage } from './pages/signin'
import { SignUpPage } from './pages/signup'
import { PasswordPage } from './pages/password'
import { ForgotPage } from './pages/forgot'

export function App() {
  const history = useHistory()
  const config = {
    userPoolId: `${process.env.CDK_AWS_COGNITO_USER_POOL_ID}`,
    userPoolWebClientId: `${process.env.CDK_AWS_COGNITO_USER_POOL_WEBCLIENT_ID}`,
    graphQlUrl: `${process.env.CDK_AWS_APPSYNC_URL}`,
    appVersion: `${process.env.npm_package_version}`,
    appEnv: `${process.env.CDK_STACK_ENV}`,
  }

  return (
    <AppProvider
      config={config}
      onLinkError={({ networkError, graphQLErrors }) => {
        if (networkError && networkError.statusCode === 401) {
          return history.push('/signin')
        }
      }}
    >
      <Route path="/signin" exact>
        <SignInPage />
      </Route>
      <Route path="/signup" exact>
        <SignUpPage />
      </Route>
      <Route path="/password" exact>
        <PasswordPage />
      </Route>
      <Route path="/forgot" exact>
        <ForgotPage />
      </Route>
      <Route path="/" exact>
        <CheckAuth>
          <DashboardPage />
        </CheckAuth>
      </Route>
      <Route path="/profile" exact>
        <CheckAuth>
          <DashboardPage />
        </CheckAuth>
      </Route>
      <Route path="/products" exact>
        <CheckAuth>
          <ProductPage />
        </CheckAuth>
      </Route>
    </AppProvider>
  )
}

function CheckAuth({ children }) {
  const { state } = useLocation()
  const hasToken = Boolean(localStorage.getItem('token'))
  const { user = hasToken ? {} : undefined, setUser, Auth } = useContext(AppContext)
  const fetchCurrentAuthenticatedUser = async () => {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser()
      localStorage.setItem('token', cognitoUser.signInUserSession.accessToken.jwtToken)
      setUser(cognitoUser)
    } catch (error) {
      localStorage.removeItem('token')
      setUser(undefined)
    }
  }

  useEffect(() => {
    fetchCurrentAuthenticatedUser()
  }, [])

  if (!user) {
    return (
      <Redirect
        to={{
          pathname: '/signin',
          state,
        }}
      />
    )
  }

  return children
}
