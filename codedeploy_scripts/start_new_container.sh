echo "Fetching IMDS token"
TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`

echo "Fetching region"
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region -H "X-aws-ec2-metadata-token: $TOKEN")

echo "Fetching Account ID"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

echo "Pulling new image and starting new container..."
docker pull ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/halloween-personality-test/backend:latest

docker run -d --name halloween-personality-test-backend --restart unless-stopped -p 80:3000 ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/halloween-personality-test/backend:latest