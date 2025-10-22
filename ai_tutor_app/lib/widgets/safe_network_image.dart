import 'package:flutter/material.dart';
import 'package:ai_tutor_app/utils/responsive_utils.dart';

class SafeNetworkImage extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;
  final BorderRadiusGeometry borderRadius;

  const SafeNetworkImage({
    super.key,
    this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
    this.borderRadius = const BorderRadius.all(Radius.circular(12)),
  });

  @override
  Widget build(BuildContext context) {
    final double defaultWidth = Responsive.isDesktop(context) ? 320 : 240;
    final double defaultHeight = Responsive.isDesktop(context) ? 200 : 160;

    final double resolvedWidth = width ?? defaultWidth;
    final double resolvedHeight = height ?? defaultHeight;

    if (imageUrl == null || imageUrl!.isEmpty) {
      return _buildErrorWidget(context, resolvedWidth, resolvedHeight);
    }

    return ClipRRect(
      borderRadius: borderRadius,
      child: Image.network(
        imageUrl!,
        width: resolvedWidth,
        height: resolvedHeight,
        fit: fit,
        loadingBuilder: (context, child, progress) {
          if (progress == null) return child;
          return placeholder ??
              _buildPlaceholder(context, resolvedWidth, resolvedHeight);
        },
        errorBuilder: (context, error, stackTrace) {
          return errorWidget ??
              _buildErrorWidget(context, resolvedWidth, resolvedHeight);
        },
      ),
    );
  }

  Widget _buildPlaceholder(BuildContext context, double w, double h) {
    return Container(
      width: w,
      height: h,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.3),
        borderRadius: borderRadius,
      ),
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
    );
  }

  Widget _buildErrorWidget(BuildContext context, double w, double h) {
    return Container(
      width: w,
      height: h,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
        borderRadius: borderRadius,
      ),
      child: Icon(
        Icons.image_not_supported_outlined,
        size: Responsive.isDesktop(context) ? 48 : 32,
        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
      ),
    );
  }
}
