using System.Text;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Amazon.S3;
using Amazon.Runtime;
using Amazon;
using DigitalMenuSystem.API.Data;
using DigitalMenuSystem.API.Services.Auth;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
Env.Load();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Digital Menu System API", Version = "v1" });
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure PostgreSQL Database Connection
var connectionString = $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
                      $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                      $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
                      $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};" +
                      $"Port={Environment.GetEnvironmentVariable("DB_PORT")};";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Configure AWS S3
var awsAccessKey = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY");
var awsSecretKey = Environment.GetEnvironmentVariable("AWS_SECRET_KEY");
var awsRegion = Environment.GetEnvironmentVariable("AWS_REGION");

var awsCredentials = new BasicAWSCredentials(awsAccessKey, awsSecretKey);
var s3Config = new AmazonS3Config
{
    RegionEndpoint = RegionEndpoint.GetBySystemName(awsRegion)
};

builder.Services.AddSingleton<IAmazonS3>(new AmazonS3Client(awsCredentials, s3Config));

// Configure JWT Authentication
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "DigitalMenuSystem";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "DigitalMenuSystem";

if (string.IsNullOrEmpty(jwtSecret))
{
    throw new InvalidOperationException("JWT_SECRET environment variable is not set!");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero // Remove default 5 minute tolerance
    };
});

builder.Services.AddAuthorization();

// Register Services (Dependency Injection)
builder.Services.AddScoped<IAuthService, AuthService>();
// Add more services here later (IMenuService, IOrderService, etc.)

// Configure CORS for React apps
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowAll");

// Enable Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

// Test endpoint (can remove later)
app.MapGet("/", () => new
{
    message = "Digital Menu System API is running",
    timestamp = DateTime.UtcNow,
    version = "1.0.0"
})
.WithName("Root")
.WithOpenApi();

app.Run();