using DataLayer.EFCore;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Tests.Integration.Helper
{
	internal class DbContextFactory
	{
		internal static AppDbContext Initiate()
		{
			var connection = new SqliteConnection("DataSource=:memory:");
			connection.Open(); // Open the connection
			var serviceProvider = new ServiceCollection()
				.AddEntityFrameworkSqlite()
		 .BuildServiceProvider();

			var options = new DbContextOptionsBuilder<AppDbContext>()
				 .UseSqlite(connection)
			.UseInternalServiceProvider(serviceProvider)
				 .Options;

			var dbContext = new AppDbContext(options);
			dbContext.Database.EnsureCreated();

			return dbContext;
		}
	}
}
