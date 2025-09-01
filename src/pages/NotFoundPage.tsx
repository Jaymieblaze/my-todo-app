import { useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card'; 
import Button from '../components/Button'; 

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="max-w-md w-full text-center p-8">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-gray-800 mb-2">404</CardTitle>
          <CardDescription className="text-xl text-gray-600 mb-4">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">
            The page you are looking for does not exist or an unexpected error occurred.
          </p>
          <Button onClick={() => navigate('/todos')}>
            Go to Todo List
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;