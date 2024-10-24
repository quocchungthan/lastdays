using Business.Domain;
using Microsoft.EntityFrameworkCore;

namespace DataLayer.EFCore
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

		public DbSet<User> Users { get; set; }

		public DbSet<EventLog> Events { get; set; }

		public DbSet<Board> Boards { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<User>()
				.HasKey(x => x.Id);
			modelBuilder.Entity<EventLog>()
				.HasKey(x => x.Id);
			modelBuilder.Entity<Board>()
				.HasKey(x => x.Id);

			modelBuilder.Entity<Board>()
				.HasMany(x => x.LastEvents)
				.WithOne()
				.OnDelete(DeleteBehavior.Cascade);
			modelBuilder.Entity<Board>()
				.HasMany(x => x.FirstEvents)
				.WithOne()
				.OnDelete(DeleteBehavior.Cascade);
			modelBuilder.Entity<User>()
				.HasMany(x => x.LastEvents)
				.WithOne()
				.OnDelete(DeleteBehavior.Cascade);
		}
	}
}
