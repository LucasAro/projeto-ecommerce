import boto3

def test_s3_connection():
    s3 = boto3.client(
        's3',
        endpoint_url='http://localstack:4566',
        aws_access_key_id='test',
        aws_secret_access_key='test',
        region_name='us-east-1',
        verify=False,
        use_ssl=False
    )

    try:
        bucket_name = 'test-bucket-python'
        s3.create_bucket(Bucket=bucket_name)
        print(f"Bucket {bucket_name} criado com sucesso!")

        test_data = b"Hello from Python!"
        s3.put_object(
            Bucket=bucket_name,
            Key='test.txt',
            Body=test_data
        )
        print("Arquivo uploaded com sucesso!")

        response = s3.list_buckets()
        print("\nBuckets existentes:")
        for bucket in response['Buckets']:
            print(f"- {bucket['Name']}")

        objects = s3.list_objects_v2(Bucket=bucket_name)
        print(f"\nObjetos no bucket {bucket_name}:")
        for obj in objects.get('Contents', []):
            print(f"- {obj['Key']}")

    except Exception as e:
        print(f"Erro: {str(e)}")
        raise e

if __name__ == "__main__":
    test_s3_connection()