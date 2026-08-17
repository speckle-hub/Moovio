import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center">
      <EmptyState
        icon={<Film size={22} strokeWidth={1.5} />}
        title="This scene didn't make the cut"
        description="The page you're looking for doesn't exist — or has moved to a different screening room."
        action={
          <Link to="/">
            <Button variant="primary" size="md">Back to home</Button>
          </Link>
        }
      />
    </div>
  )
}
