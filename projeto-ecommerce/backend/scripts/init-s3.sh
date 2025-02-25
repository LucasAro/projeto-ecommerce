#!/bin/bash
echo "Waiting for LocalStack to be ready..."
sleep 10

awslocal s3 mb s3://product-images

echo "S3 bucket 'product-images' created."