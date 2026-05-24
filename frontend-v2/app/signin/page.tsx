import SignInForm from '@/components/SignInForm'

interface SignInPageProps {
  searchParams?: Promise<{
    email?: string
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  return <SignInForm initialEmail={resolvedSearchParams?.email || ''} />
}
