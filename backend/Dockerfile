# ---- Stage 1: Build ----
FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /workspace

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw

# Cache Maven repo across builds
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -q dependency:go-offline

COPY src src

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -q clean package -DskipTests

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:25-jre-alpine

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /workspace/target/*.jar app.jar

# Non-root ownership
RUN chown -R spring:spring /app

USER spring

EXPOSE 4000

# JVM tuning for container awareness
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]