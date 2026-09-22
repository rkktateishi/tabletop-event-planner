using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TabletopEvents.Api.Data;
using TabletopEvents.Api.Repositories;
using TabletopEvents.Api.Validation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddRepositories();

// Services/<Name>Service/<Name>Service.cs classes are the HTTP endpoints. [ApiController] marks them
// as controllers for routing even though their names do not end in "Controller".
builder.Services.AddControllers(options =>
{
    // FluentValidation owns request validation; the framework's implicit [Required] on
    // non-nullable strings would otherwise report missing fields before our validators run.
    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
    options.Filters.Add<FluentValidationActionFilter>();
});
// Let FluentValidationActionFilter own every 400, including model-binding failures, so all
// validation errors reach clients in one shape.
builder.Services.Configure<ApiBehaviorOptions>(options => options.SuppressModelStateInvalidFilter = true);
builder.Services.AddValidatorsFromAssemblyContaining<AppDbContext>();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

const string DevCorsPolicy = "AllowDev";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Apply pending migrations (and seed data) on startup so `docker compose up` needs no manual step.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors(DevCorsPolicy);
app.MapControllers();

app.Run();
