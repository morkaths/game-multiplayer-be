FROM node:18-alpine

WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép mã nguồn
COPY . .

EXPOSE 5000

CMD ["npm", "start"] 