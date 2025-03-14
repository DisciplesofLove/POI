from setuptools import setup, find_packages

setup(
    name="decentralized-ai-inference",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "web3>=6.0.0",
        "torch>=2.0.0",
        "eth-typing>=3.0.0",
        "eth-account>=0.8.0",
        "aiohttp>=3.8.0",
        "pytest>=7.0.0",
    ],
    python_requires=">=3.8",
    author="AI Platform Team",
    description="Decentralized platform for AI model inference",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/decentralized-ai-inference",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
)