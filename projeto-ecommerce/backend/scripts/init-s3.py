import boto3

def create_bucket():
    s3 = boto3.client(
        's3',
        endpoint_url='http://localstack:4566',
        aws_access_key_id='test',
        aws_secret_access_key='test',
        region_name='us-east-1',
        verify=False
    )

    try:
        s3.create_bucket(Bucket='product-images')
        print("Bucket 'product-images' created successfully")
    except Exception as e:
        print(f"Error creating bucket: {str(e)}")

if __name__ == "__main__":
    create_bucket()